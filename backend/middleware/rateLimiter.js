const ipRequestCounts = new Map();

// Clean up memory every 10 minutes
setInterval(() => {
  ipRequestCounts.clear();
}, 10 * 60 * 1000);

export const rateLimiter = (limit = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    
    if (!ipRequestCounts.has(ip)) {
      ipRequestCounts.set(ip, []);
    }
    
    const requests = ipRequestCounts.get(ip).filter(timestamp => now - timestamp < windowMs);
    requests.push(now);
    ipRequestCounts.set(ip, requests);
    
    if (requests.length > limit) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests from this IP. Please try again later.'
      });
    }
    
    next();
  };
};
export default rateLimiter;
