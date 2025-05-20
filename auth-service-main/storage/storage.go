package storage

import (
	"AuthMicroservice/types"
	"database/sql"
	"fmt"
	_ "github.com/lib/pq"
)

type Storage interface {
	CreateAccount(*types.Account) (int, error)
	GetAccountByID(int) (*types.Account, error)
	GetAccountByUserName(string) (*types.Account, error)
	DeleteAccountByID(int) error
}

type PostgresStore struct {
	db *sql.DB
}

func NewPostgresStore() (*PostgresStore, error) {
	connStr := "user=postgres dbname=auth password=cs.vsu.ru sslmode=disable"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}
	if err := db.Ping(); err != nil {
		return nil, err
	}
	return &PostgresStore{
		db: db,
	}, nil

}

func (s *PostgresStore) Init() error {
	err := s.CreateAccountTable()
	return err
}

func (s *PostgresStore) CreateAccountTable() error {
	query := `create table if not exists account( 
			id serial primary key,			
			user_name varchar(50) UNIQUE, 
    		encrypted_password varchar(100),
    		user_type varchar(50)
		)`

	_, err := s.db.Exec(query)
	return err
}

func (s *PostgresStore) CreateAccount(acc *types.Account) (int, error) {
	query := `insert into account (user_name,encrypted_password, user_type)
								   values ($1, $2, $3) returning id`
	var id int
	err := s.db.QueryRow(query,
		acc.UserName,
		acc.EncryptedPassword,
		acc.UserType,
	).Scan(&id)

	if err != nil {
		return 0, err
	}

	return id, nil
}

func (s *PostgresStore) DeleteAccountByID(id int) error {
	_, err := s.db.Query(`delete from account where id = $1`, id)
	return err
}

func (s *PostgresStore) GetAccountByID(id int) (*types.Account, error) {
	rows, err := s.db.Query(`select * from account where id = $1`, id)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		return scanIntoAccount(rows)
	}
	return nil, fmt.Errorf("account %d not found", id)
}


func (s *PostgresStore) GetAccountByUserName(userName string) (*types.Account, error) {
	rows, err := s.db.Query(`select * from account where user_name = $1`, userName)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		return scanIntoAccount(rows)
	}
	return nil, fmt.Errorf("account with username %s not found", userName)
}

func scanIntoAccount(rows *sql.Rows) (*types.Account, error) {
	account := new(types.Account)
	err := rows.Scan(
		&account.ID,
		&account.UserName,
		&account.EncryptedPassword,
		&account.UserType,
	)
	return account, err
}
