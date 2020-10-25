const errors = [
  { code: 500, msg: "Internal Server Error" },
  { code: 503, msg: "Service Temporarily Unavailable" },
  { code: 504, msg: "Gateway Time-out" },
  { code: 400, msg: "Bad Request" },
  { code: 403, msg: "Forbidden" },
  { code: 404, msg: "Not Found" },
  { code: 409, msg: "Conflict" }
];

export function success(res, data = null) {
  
  if (data === null) {
    respond(res, { status: 200, response: "Ok" });
  } else {
    respond(res, { status: 200, response: { err: null, data: data } });
  }

}

export function failure(res, err = {}) {
  
  if ( !err.code || !(err.code >= 100 &&  err.code <= 599) ) err.code = 500;
  if (!err.msg) err.msg = errors.find(error => error.code === err.code)?.msg || null;

  respond(res, { status: err.code, response: { err: err.msg, data: null } });

}

function respond (res, result) { 

  if ( typeof(result.response) === "string" )
  {
    res.status(result.status).send(result.response);
  }
  else 
  {
    res.status(result.status).json(result.response); 
  }
  
}