# Add ssh id to agent manually if bash_rc fails
echo "SSH login started"
ssh-agent -s
ssh-add ~/.ssh/id_ed25519