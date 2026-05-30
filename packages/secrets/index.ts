import dotenv from 'dotenv'

dotenv.config({
    path : '../../.env'
})

const Secrets = {
    // frontend secrets
    PUBLIC_BACKEND : process.env.NEXT_PUBLIC_BACKEND_URL,
    PUBLIC_WS_URL : process.env.NEXT_PUBLIC_BACKEND_WS_URL,
    CLERK_PUBLISHABLE_KEY : process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY : process.env.CLERK_SECRET_KEY,


    // backend secrets
    HTTP_PORT : process.env.HTTP_PORT,
    WS_PORT : process.env.WS_PORT || 4001
}

export default Secrets