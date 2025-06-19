import { Hono } from 'hono';
import { PairController, PostController, OrderController } from '../controllers/index';
import { authMiddleware } from '../middleware/auth.middleware';

const P2PRoutes = new Hono();
const pairCtrl = new PairController();
const postCtrl = new PostController();
const orderCtrl = new OrderController();

// Get all wallets for a user
P2PRoutes.get('/getWallets', authMiddleware, pairCtrl.getWallets)


// currency
P2PRoutes.get('/getCurrency', authMiddleware, pairCtrl.getAllCurrency)

// withdraw
P2PRoutes.post('/withdraw', authMiddleware, pairCtrl.withdrawRequest)
P2PRoutes.post('/transfer', authMiddleware, pairCtrl.transfer)


P2PRoutes.post('/getDepositAddress', authMiddleware, pairCtrl.getDepositAddress)
// Get a specific wallet
P2PRoutes.get('/getWallets/:currency', (c) => pairCtrl.getWallet(c))

// Send a transaction
P2PRoutes.post('/:walletId/transactions', (c) => pairCtrl.sendTransaction(c))

// Get transaction history
P2PRoutes.get('/:walletId/transactions', (c) => pairCtrl.getTransactionHistory(c))

// Get a specific transaction
P2PRoutes.get('/transactions/:txHash', (c) => pairCtrl.getTransaction(c))

// Webhook endpoint for blockchain notifications
P2PRoutes.post('/webhooks/:currency', (c) => pairCtrl.processWebhook(c))

P2PRoutes.post('/create-address', (c) => pairCtrl.createAddress(c))
P2PRoutes.post('/withdraw', (c) => pairCtrl.withdrawRequest(c))

P2PRoutes.get('/eth-service-initialization', (c) => pairCtrl.ethServiceInitialization(c));

export default P2PRoutes;