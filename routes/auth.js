const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

//REGISTER
router.post("/register", async (req, res) => {
    const newUser = User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SECRET).toString(),
    });

    try {
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);

    } catch(err) {
        res.status(500).json(err);
    };
});

//LOGIN
router.post("/login", async (req, res) => {
    try{
        const user = await User.findOne({
            username: req.body.username
        });
        !user && res.status(401).json("Credenciais Errados!")

        const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SECRET);
        const PWD = hashedPassword.toString(CryptoJS.enc.Utf8);

        const testandoPassword = req.body.password;

        PWD != testandoPassword && res.status(401).json("Credenciais Errados!");

        const accessToken = jwt.sign({
            id: user._id,
            isAdmin: user.isAdmin,
        },
            process.env.JWT_SECRET,
            {expiresIn: "3d"},
        );

        const {password, ...others} = user._doc;

        res.status(200).json({...others, accessToken});
    }catch(err){
        // res.status(500).json(err);
    }
})


// //LOGIN
// router.post("/login", async (req, res) => {
//     try{
//         const user = await User.findOne({
//             username: req.body.username
//         });

//         const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SECRET);
//         const password = hashedPassword.toString(CryptoJS.enc.Utf8);

//         if(user !== req.body.username){
//             res.status(401).json("Wrong Credentials!")
//         } else if(password !== req.body.password){
//             res.status(401).json("Wrong Credentials!");
//         }else{
//             res.status(200).json(user);
//         }

//     }catch(err){
//         res.status(500).json(err);
//     }
// })

module.exports = router;