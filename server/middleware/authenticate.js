import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authenticate = (req,res,next) => {
  let token = req.header('x-auth');
  const secret = process.env.SECRET;
  if(!token){
    return res.status(401).send({error: 'not authenticated, You need a token'});
  }
  try{
    let decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  }catch(e){
    return res.status(401).send({
      msg: 'invalid token',
      error: e,
    });
  }
  
}

export default authenticate;
