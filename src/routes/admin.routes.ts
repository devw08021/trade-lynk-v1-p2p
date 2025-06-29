import { Hono } from 'hono';
import { PairController, PostController, OrderController } from '../controllers/index';
import { authMiddleware } from '../middleware/auth.middleware';

const adminRoutes = new Hono();
const pairCtrl = new PairController();
const postCtrl = new PostController();
const orderCtrl = new OrderController();

// Get all wallets for a user
adminRoutes.get('/pairs', authMiddleware, pairCtrl.getAllPairs)

// lists
adminRoutes.get('/ads', postCtrl.getAllPost)
adminRoutes.get('/orders', orderCtrl.getAllOrder)
adminRoutes.get('/disputes', orderCtrl.getDisputeOrder)


// create offer and trade
adminRoutes.post('/offer', authMiddleware, postCtrl.addPost)
adminRoutes.post('/trade', authMiddleware, orderCtrl.addOrder)

// trade status update
adminRoutes.post('/trade/paid/:id', authMiddleware, orderCtrl.orderPaid)
adminRoutes.post('/trade/complete/:id', authMiddleware, orderCtrl.orderComplete)
adminRoutes.post('/trade/cancel/:id', authMiddleware, orderCtrl.orderCancel)
adminRoutes.post('/trade/dispute/:id', authMiddleware, orderCtrl.orderDispute)


// user history
adminRoutes.get('/my-offers', authMiddleware, postCtrl.getPostUserHis)
adminRoutes.get('/my-trades', authMiddleware, orderCtrl.getOrderUserHis)


// during trade process
adminRoutes.get('/trade/:id', authMiddleware, orderCtrl.getOrderById)
adminRoutes.get('/trade/:id/status', authMiddleware, orderCtrl.getOrderById)

//message
adminRoutes.get('/trade/:id/messages', authMiddleware, orderCtrl.getMessages)
adminRoutes.post('/trade/:id/message', authMiddleware, orderCtrl.addMessage)
export default adminRoutes;