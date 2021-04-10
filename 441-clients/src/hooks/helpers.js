import { useState } from 'react'

function useFlag(initialValue) {
  const [flag, setFlag] = useState(initialValue);
  const setTrue = () => setFlag(true);
  const setFalse = () => setFlag(false);
  return [flag, setTrue, setFalse]
}

export { useFlag }