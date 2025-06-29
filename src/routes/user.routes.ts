import { Hono } from 'hono';
import { PairController, PostController, OrderController } from '../controllers/index';
import { authMiddleware } from '../middleware/auth.middleware';

const userRoutes = new Hono();
const pairCtrl = new PairController();
const postCtrl = new PostController();
const orderCtrl = new OrderController();

// Get all wallets for a user
userRoutes.get('/getPairs', authMiddleware, pairCtrl.getActivePair)

// list offer
userRoutes.get('/offers', postCtrl.getPostByFilterForDashBoard)

// create offer and trade
userRoutes.post('/offer', authMiddleware, postCtrl.addPost)
userRoutes.post('/trade', authMiddleware, orderCtrl.addOrder)

// trade status update
userRoutes.post('/trade/paid/:id', authMiddleware, orderCtrl.orderPaid)
userRoutes.post('/trade/complete/:id', authMiddleware, orderCtrl.orderComplete)
userRoutes.post('/trade/cancel/:id', authMiddleware, orderCtrl.orderCancel)
userRoutes.post('/trade/dispute/:id', authMiddleware, orderCtrl.orderDispute)


// user history
userRoutes.get('/my-offers', authMiddleware, postCtrl.getPostUserHis)
userRoutes.get('/my-trades', authMiddleware, orderCtrl.getOrderUserHis)


// during trade process
userRoutes.get('/trade/:id', authMiddleware, orderCtrl.getOrderById)
userRoutes.get('/trade/:id/status', authMiddleware, orderCtrl.getOrderById)

//message
userRoutes.get('/trade/:id/messages', authMiddleware, orderCtrl.getMessages)
userRoutes.post('/trade/:id/message', authMiddleware, orderCtrl.addMessage)
export default userRoutes;