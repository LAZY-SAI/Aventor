import {Router} from 'express'

const useRoute = Router();

//userdetails



//user login route
useRoute.post('/login', (req, res) => {

  console.log("user logged in with ",req.body);
  const { email, password } = req.body;

  if (email !== 'user@gmail.com' || password !== 'user') {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  return res.status(200).json({
    message: "user logged in successfully",
    email
  });
});

export default useRoute