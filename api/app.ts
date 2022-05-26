import server from "./server";

const port = parseInt(process.env.PORT || "3001");

const starter = new server()
  .start(port)
  .then((port) => console.log(`Running on port ${port}`))
  .catch((error) => {
    console.log(error);
  });

export default starter;
