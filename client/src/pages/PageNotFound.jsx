import { Button } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

const PageNotFound = () => {
  const navigate = useNavigate()
  return (
    <>
      <div>PageNotFound</div>
     <Button onClick={()=>navigate("/")}>Go Back</Button> 
    </>
  );
};

export default PageNotFound;
