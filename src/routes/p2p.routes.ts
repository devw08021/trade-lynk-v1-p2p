import { Hono } from 'hono';
import { PairController, PostController, OrderController } from '../controllers/index';
import { authMiddleware } from '../middleware/auth.middleware';
import { p2pRoutes } from '.';

const P2PRoutes = new Hono();
const pairCtrl = new PairController();
const postCtrl = new PostController();
const orderCtrl = new OrderController();

// Get all wallets for a user
P2PRoutes.get('/getPairs', authMiddleware, pairCtrl.getActivePair)

// list offer
P2PRoutes.get('/offers', postCtrl.getPostByFilterForDashBoard)

// create offer and trade
P2PRoutes.post('/offer', authMiddleware, postCtrl.addPost)
P2PRoutes.post('/trade', authMiddleware, orderCtrl.addOrder)
// update trade
p2pRoutes.post('/trade/paid', authMiddleware, orderCtrl.orderPaid)
P2PRoutes.post('/trade/complete', authMiddleware, orderCtrl.OrderComplete)
P2PRoutes.post('trade/dispute', authMiddleware, orderCtrl.orderDispute)
P2PRoutes.post('trade/calcel', authMiddleware, orderCtrl.orderCancel)


// user history
P2PRoutes.get('/my-offers', authMiddleware, postCtrl.getPostUserHis)
P2PRoutes.get('/my-trades', authMiddleware, orderCtrl.getOrderUserHis)


// during trade process
P2PRoutes.get('/trade/:id', authMiddleware, orderCtrl.getOrderById)
P2PRoutes.get('/trade/:id/status', authMiddleware, orderCtrl.getOrderById)

//message
P2PRoutes.get('/trade/:id/messages', authMiddleware, orderCtrl.getMessages)
P2PRoutes.post('/trade/:id/message', authMiddleware, orderCtrl.addMessage)
export default P2PRoutes;