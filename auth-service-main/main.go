package main

import (
	"AuthMicroservice/api"
	"AuthMicroservice/storage"
	"AuthMicroservice/types"
	"flag"
	"fmt"
	"log"
)

func seedAccount(store storage.Storage, userName, pw string, userType types.UserType) *types.Account {
	acc, err := types.NewAccount(userName, pw, userType)
	if err != nil {
		log.Fatal(err)
	}
	if _, err := store.CreateAccount(acc); err != nil {
		log.Fatal(err)
	}
	fmt.Println("new account ", acc)
	return acc
}

func seedAccounts(store storage.Storage) {
	seedAccount(store, "m1ll3r", "1337", types.UserTypeAdmin)
	seedAccount(store, "m1ll3r1337", "1337", types.UserTypeRegular)
}

func main() {
	seed := flag.Bool("seed", false, "seed the db")
	flag.Parse()
	store, err := storage.NewPostgresStore()
	if err != nil {
		log.Fatal(err)
	}
	if err = store.Init(); err != nil {
		log.Fatal(err)
	}
	if *seed {
		fmt.Println("seeding the db")
		seedAccounts(store)
	}
	server := api.NewAPIServer(":3000", store)
	server.Run()
}
