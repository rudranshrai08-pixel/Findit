import { send } from "./auth.js";

const listingsApi = {
  all: () => send("/api/listings").then((result) => result.listings),
  contact: (id) => send("/api/listings/" + id + "/contact"),
  createClaim: (id, privateDetails) => send("/api/listings/" + id + "/claims", { method: "POST", body: JSON.stringify({ privateDetails }) }),
  create: (listing) => send("/api/listings", { method: "POST", body: JSON.stringify(listing) }).then((result) => result.listing),
};

export default listingsApi;