import cron from "node-cron";
import { PostService, OrderService } from "@/services";

const postService = new PostService();
const orderService = new OrderService();
// cancel open Order
cron.schedule("* * * * * *", () => {
    orderService.timeOutOpenOrder();
});




// post
cron.schedule("* * * * * *", () => {
    postService.timeOutOpenPost();
})