const ImageKit  = require('@imagekit/nodejs')

const imageKit = new ImageKit ({
    privateKey: process.env.IMAGEKIT_KEY,
})

module.exports = imageKit