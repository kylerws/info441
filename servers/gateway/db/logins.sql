CREATE TABLE IF NOT EXISTS LoginAttempts (
    ID int not null auto_increment primary key,
    UserID int not null,
    LoginTime DateTime,
    IpAddress varchar(255)
);