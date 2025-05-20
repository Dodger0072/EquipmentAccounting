package types

import (
	"golang.org/x/crypto/bcrypt"
)

type UserType string

const (
	UserTypeRegular UserType = "Regular"
	UserTypeAdmin   UserType = "Admin"
)

type Account struct {
	ID                int      `json:"id"`
	UserName          string   `json:"userName"`
	EncryptedPassword string   `json:"-"`
	UserType          UserType `json:"userType"`
}

type CreateAccountRequest struct {
	UserName string   `json:"userName"`
	Password string   `json:"password"`
	UserType UserType `json:"userType"`
}

func NewAccount(userName, password string, userType UserType) (*Account, error) {
	encpw, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	return &Account{
		UserName:          userName,
		EncryptedPassword: string(encpw),
		UserType:          userType,
	}, nil
}

type LoginRequest struct {
	UserName string `json:"userName"`
	Password string `json:"password"`
}

type LoginResponse struct {
	UserName string `json:"userName"`
	Token    string `json:"token"`
}

func (acc *Account) ValidPassword(pw string) bool {
	return bcrypt.CompareHashAndPassword([]byte(acc.EncryptedPassword), []byte(pw)) == nil
}
