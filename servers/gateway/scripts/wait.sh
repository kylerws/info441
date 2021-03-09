echo Press any key to exit...
while true; do
  read -n 1
  if [ $? = 0 ] ; then
  exit ;
  fi
done