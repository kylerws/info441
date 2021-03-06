package handlers

import (
	"assignments-fixed-kylerws/servers/gateway/models/users"
	"errors"
)

//
var ErrInsertingUser = errors.New("Duplicate user information")

// MockUserStore mocks users.Store to use in testing
type MockUserStore struct {
	currID      int64
	idMap       map[int64]*users.User
	emailMap    map[string]*users.User
	usernameMap map[string]*users.User
}

// NewMockUserDB create a mock UserStore according to the users.Store interface
func NewMockUserDB() *MockUserStore {
	return &MockUserStore{1, make(map[int64]*users.User), make(map[string]*users.User), make(map[string]*users.User)}
}

//GetByID returns the User with the given ID
func (mus *MockUserStore) GetByID(id int64) (*users.User, error) {
	if _, exists := mus.idMap[id]; exists {
		return mus.idMap[id], nil
	}
	return nil, users.ErrUserNotFound
}

//GetByEmail returns the User with the given email
func (mus *MockUserStore) GetByEmail(email string) (*users.User, error) {
	if _, exists := mus.emailMap[email]; exists {
		return mus.emailMap[email], nil
	}
	return nil, users.ErrUserNotFound
}

//GetByUserName returns the User with the given Username
func (mus *MockUserStore) GetByUserName(username string) (*users.User, error) {
	if _, exists := mus.usernameMap[username]; exists {
		return mus.usernameMap[username], nil
	}
	return nil, users.ErrUserNotFound
}

//Insert inserts the user into the database, and returns
//the newly-inserted User, complete with the DBMS-assigned ID
func (mus *MockUserStore) Insert(user *users.User) (*users.User, error) {
	id := mus.currID
	email := user.Email
	username := user.UserName
	// email already exists, return error
	if _, emailExists := mus.emailMap[email]; emailExists {
		return nil, ErrInsertingUser
	}
	// username already exists, return error
	if _, usernameExists := mus.usernameMap[username]; usernameExists {
		return nil, ErrInsertingUser
	}
	user.ID = id
	mus.idMap[id] = user
	mus.emailMap[email] = user
	mus.usernameMap[username] = user
	mus.currID++
	return user, nil
}

//Update applies UserUpdates to the given user ID
//and returns the newly-updated user
func (mus *MockUserStore) Update(id int64, updates *users.Updates) (*users.User, error) {
	user, _ := mus.GetByID(id)
	err := user.ApplyUpdates(updates)
	if err != nil {
		return nil, err
	}
	return user, nil
}

//Delete deletes the user with the given ID
func (mus *MockUserStore) Delete(id int64) error {
	// comment out for test coverage. Since we don't need this function (yet) for our
	// auth.go
	// user, err := mus.GetByID(id)
	// if err != nil {
	//  return users.ErrDeleteUser
	// }
	// email := user.Email
	// username := user.UserName
	// delete(mus.idMap, id)
	// delete(mus.emailMap, email)
	// delete(mus.usernameMap, username)
	return nil
}

// TrackLogin ...
func (mus *MockUserStore) TrackLogin(UserID int64, IPAddress string) error {
	// Not implemented yet
	return nil
}

//InsertUserLog inserts the user log into the database
// func (mus *MockUserStore) InsertUserLog(userLog *users.UserLog) (*users.UserLog, error) {
// 	return nil, nil
// }

// //GetUserLogByID return the userLog with the given ID
// func (mus *MockUserStore) GetUserLogByID(id int64) (*users.UserLog, error) {
// 	return nil, nil
// }

// //DeleteUserLog deletes the userLog with the given ID
// func (mus *MockUserStore) DeleteUserLog(id int64) error {
// 	return nil
// }
