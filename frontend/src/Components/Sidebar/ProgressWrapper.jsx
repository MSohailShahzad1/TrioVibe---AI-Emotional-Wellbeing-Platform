import React from 'react'
import { useUser } from '../../Context/UserContext'
import Progress from './Progress'

const ProgressWrapper = () => {
  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  return <Progress userId={userProfile?._id} />;
};

export default ProgressWrapper
