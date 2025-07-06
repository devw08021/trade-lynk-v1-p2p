import { Hono } from 'hono';
import { PairController, PostController, OrderController } from '../controllers/index';
import { authMiddleware } from '../middleware/auth.middleware';

const adminRoutes = new Hono();
const pairCtrl = new PairController();
const postCtrl = new PostController();
const orderCtrl = new OrderController();


// adminRoutes.use('*', authMiddleware);

// Get all wallets for a user
adminRoutes.get('/pairs', pairCtrl.getAllPairs)
adminRoutes.get('/pair/:id', (c) => pairCtrl.getPairById(c));
adminRoutes.post('/pair', (c) => pairCtrl.addPair(c));
adminRoutes.put('/pair/:id', (c) => pairCtrl.updatePair(c));

// lists
adminRoutes.get('/ads', postCtrl.getAllPost)
adminRoutes.get('/orders', orderCtrl.getAllOrder)
adminRoutes.get('/disputes', orderCtrl.getDisputeOrder)


// create offer and trade
adminRoutes.post('/offer', postCtrl.addPost)
adminRoutes.post('/trade', orderCtrl.addOrder)

// trade status update
adminRoutes.post('/trade/paid/:id', orderCtrl.orderPaid)
adminRoutes.post('/trade/complete/:id', orderCtrl.orderComplete)
adminRoutes.post('/trade/cancel/:id', orderCtrl.orderCancel)
adminRoutes.post('/trade/dispute/:id', orderCtrl.orderDispute)


// user history
adminRoutes.get('/my-offers', postCtrl.getPostUserHis)
adminRoutes.get('/my-trades', orderCtrl.getOrderUserHis)


// during trade process
adminRoutes.get('/trade/:id', orderCtrl.getOrderById)
adminRoutes.get('/trade/:id/status', orderCtrl.getOrderById)

//message
adminRoutes.get('/trade/:id/messages', orderCtrl.getMessages)
adminRoutes.post('/trade/:id/message', orderCtrl.addMessage)
export default adminRoutes;