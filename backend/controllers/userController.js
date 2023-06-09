import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import generateToken from '../utils/generateToken.js'

// @desc Auth user & get token
// @route POST /api/users/login
// @access Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    })
  } else {
    res.status(401)
    throw new Error('Invalid email or password')
  }
})

// @desc Register a new user
// @route POST /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, pfNo,email, password } = req.body

  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(400)
    throw new Error('User already exists')
  }

  const user = await User.create({
    name,
    pfNo,
    email,
    password,
    prescription:null
  })

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      pfNo:user.pfNo,
      email: user.email,
      isAdmin: user.isAdmin,
      prescription: user.prescription,
      token: generateToken(user._id),
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

// @desc Get user profile
// @route POST /api/users/profile
// @access Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      pfNo:user.pfNo,
      email: user.email,
      prescription:user.prescription,
      isAdmin: user.isAdmin,
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// @desc Update user profile
// @route PUT /api/users/profile
// @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    if (req.body.password) {
      user.password = req.body.password
    }

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// @desc Get all users
// @route GET /api/users/
// @access Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
  res.json(users)
})

const getPres = asyncHandler(async (req, res) => {
 const users = await User.findOne({ pfNo : req.params.pfNo})
 if(users){
  res.send(users)
 }
})

// @desc Delete user
// @route DELETE /api/users/:id
// @access Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    await user.remove()
    res.json({ message: 'User removed' })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// @desc Get user by ID
// @route GET /api/users/:id
// @access Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    '-password'
  )
  if (user) {
    res.json(user)
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// @desc Update user
// @route PUT /api/users/:id
// @access Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    user.isAdmin = req.body.isAdmin 

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})


const updatePres = asyncHandler(async (req, res) => {
  const user = await User.findOne({pfNo: req.params.pfNo});
  // const user = await User.find({ pfNo : req.params.pfNo})
  // console.log(user[0].)
  console.log(req.body);
  if(req.body.prescription){
  const updatedUser = await User.updateOne({ pfNo : req.params.pfNo }, { $set:{"prescription":req.body.prescription}})
  // console.log(req.body,"===>",updatedUser);
  }
  res.send({
    "user": user ,
    "updateStatus":"success"
  })
  // if (true) {
  //   // user.prescription = req.body.prescription || user.prescription
  //   // user.disease = req.body.disease || user.disease
    
  //   // console.log("user=== ",user);
  //   // const updatedUser = await user.save()

  //   // res.json({
  //   //   _id: updatedUser._id,
  //   //   name: updatedUser.name,
  //   //   prescription: updatedUser.prescription,
  //   //   isAdmin: updatedUser.isAdmin,
  //   // })
   
  // } else {
  //   console.log("============");
  //   res.status(404)

  //   throw new Error('User not found')
  // }
})


export {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  updatePres,
  getPres
}
