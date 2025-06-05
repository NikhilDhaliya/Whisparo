import { v4 as uuidv4 } from 'uuid';

const adjectives = [
  'silly', 'wacky', 'zany', 'goofy', 'quirky',
  'dizzy', 'bouncy', 'jumpy', 'wiggly', 'buzzy',
  'fuzzy', 'fluffy', 'sparky', 'snappy', 'zippy'
];

const animals = [
  'cat', 'dog', 'fox', 'owl', 'bat',
  'bee', 'pig', 'cow', 'rat', 'duck',
  'frog', 'bear', 'lion', 'tiger', 'wolf'
];

const generateFriendlyUsername = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const id = uuidv4().split('-')[0].slice(0, 4); // Shorter ID
  return `${adjective}_${animal}_${id}`;
};

export const setUsernameMiddleware = (req, res, next) => {
  const usernameCookie = req.cookies.username;

  if (usernameCookie) {
    try {
      const parsed = JSON.parse(usernameCookie);
      req.sessionUsername = parsed.username;
    } catch (e) {
      console.error('Error parsing username cookie:', e);
      req.sessionUsername = 'Anonymous';
    }
  } else {
    req.sessionUsername = 'Anonymous';
  }
  
  next();
};


//to be applied to the protected routes like post, comment etc,