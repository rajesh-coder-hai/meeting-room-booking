import { updateBooking } from "./api/api";

const gradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)",
    "linear-gradient(135deg, #56ccf2 0%, #2f80ed 100%)",
    "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)",
    "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
  ];
  export const getRandomColor = () => {
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#A833FF", "#33FFF5"];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  export  const randomGradient =()=> gradients[Math.floor(Math.random() * gradients.length)];