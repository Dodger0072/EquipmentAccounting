package api

import (
	"AuthMicroservice/storage"
	"AuthMicroservice/types"
	"encoding/json"
	"fmt"
	_ "github.com/golang-jwt/jwt"
	"github.com/gorilla/mux"
	"log"
	"net/http"
	"strconv"
	"time"
)

func (s *APIServer) Run() {
	router := mux.NewRouter()

	router.HandleFunc("/login", makeHTTPHandleFunc(s.handleLogin))

	router.HandleFunc("/admin", validateAdmin)
	router.HandleFunc("/user", validateUser)

	router.HandleFunc("/accounts", adminMiddleware(makeHTTPHandleFunc(s.handleAccount)))
	router.HandleFunc("/accounts/{id}", adminMiddleware(makeHTTPHandleFunc(s.handleGetAccountByID)))

	log.Println("server running on port: ", s.listenAddr)

	err := http.ListenAndServe(s.listenAddr, router)
	if err != nil {
		return
	}
}

func (s *APIServer) handleLogin(w http.ResponseWriter, r *http.Request) error {
	var req types.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return err
	}
	acc, err := s.store.GetAccountByUserName(req.UserName)
	if err != nil {
		return err
	}
	if !acc.ValidPassword(req.Password) {
		err = fmt.Errorf("not authenticated")
		return err
	}
	token, err := createJWT(acc)
	if err != nil {
		return err
	}

	cookie := http.Cookie{
		Name:     "jwt",
		Value:    token,
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: true,
	}

	http.SetCookie(w, &cookie)
	return WriteJSON(w, http.StatusOK, "Login successful")
}

func (s *APIServer) handleAdmin(w http.ResponseWriter, r *http.Request) {
	WriteJSON(w, http.StatusOK, "permission granted")
}

type APIServer struct {
	listenAddr string
	store      storage.Storage
}

type ApiError struct {
	Error string `json:"error"`
}

func (s *APIServer) handleAccount(w http.ResponseWriter, r *http.Request) error {
	if r.Method == "POST" {
		return s.handleCreateAccount(w, r)
	}
	return nil
}

func (s *APIServer) handleCreateAccount(w http.ResponseWriter, r *http.Request) error {
	createAccountReq := new(types.CreateAccountRequest)

	if err := json.NewDecoder(r.Body).Decode(createAccountReq); err != nil {
		return err
	}
	account, err := types.NewAccount(createAccountReq.UserName,
		createAccountReq.Password, types.UserTypeRegular)

	if err != nil {
		return err
	}
	id, err := s.store.CreateAccount(account)
	if err != nil {
		return err
	}
	account.ID = id
	return WriteJSON(w, http.StatusOK, account)
}

func (s *APIServer) handleGetAccountByID(w http.ResponseWriter, r *http.Request) error {
	if r.Method == "GET" {
		id, err := getID(r)
		if err != nil {
			return err
		}
		account, err := s.store.GetAccountByID(id)
		if err != nil {
			return err
		}
		return WriteJSON(w, http.StatusOK, account)
	}
	if r.Method == "DELETE" {
		return s.handleDeleteAccount(w, r)
	}
	return fmt.Errorf("method not allowed %s", r.Method)
}

func (s *APIServer) handleDeleteAccount(w http.ResponseWriter, r *http.Request) error {
	id, err := getID(r)
	if err != nil {
		return err
	}
	if err := s.store.DeleteAccountByID(id); err != nil {
		return err
	}
	return WriteJSON(w, http.StatusOK, map[string]int{"deleted": id})
}

type apiFunc func(w http.ResponseWriter, r *http.Request) error

func makeHTTPHandleFunc(f apiFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := f(w, r); err != nil {
			WriteJSON(w, http.StatusBadRequest, ApiError{Error: err.Error()})
		}
	}
}

func NewAPIServer(listenAddr string, store storage.Storage) *APIServer {
	return &APIServer{
		listenAddr: listenAddr,
		store:      store,
	}
}

func getID(r *http.Request) (int, error) {
	idStr := mux.Vars(r)["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return id, fmt.Errorf("invalid id given %s", idStr)
	}
	return id, nil
}

func WriteJSON(w http.ResponseWriter, status int, v any) error {
	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(status)

	return json.NewEncoder(w).Encode(v)
}
