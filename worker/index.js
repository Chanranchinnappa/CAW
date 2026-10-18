import { handleRequest } from './core.js';

export default {
  fetch: (request, env) => handleRequest(request, env),
};
