import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import {Truck, Leaf, BadgeIndianRupee} from 'lucide-react'
function AboutUs() {
    return(
        <>
            <Header /> 
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
                <div className="w-full bg-gray-200 mt-10 p-6 shadow rounded">
                    <h1 className="text-3xl font-bold text-center mt-10">About Us</h1>
                    <p className="text-center mt-4 text-gray-600">Welcome to <b>M-Mart</b>, your trusted online destination for fresh groceries, fruits, vegetables, and everyday essentials. We are committed to making shopping simple, convenient, and affordable by bringing quality products directly to your doorstep. Inspired by the growing demand for hassle-free grocery shopping, M-Mart focuses on delivering fresh produce, competitive prices, and a seamless customer experience.</p>
                    <p className="text-center mt-4 text-gray-600">At M-Mart, we believe that every family deserves access to fresh and high-quality products without the stress of visiting crowded stores. Our platform is designed to help customers browse, order, and receive their daily essentials with just a few clicks. Whether you need fresh vegetables, fruits, household items, or pantry staples, we ensure that every order is handled with care and delivered efficiently.</p>
                </div>
                <div className="w-full bg-gray-200 mt-10 p-6 shadow rounded">
                    <h2 className="text-2xl font-bold text-center">Why Choose M-Mart?</h2>
                    <p className="text-center mt-4 text-gray-600">Our mission is to revolutionize the way people shop for groceries by providing a reliable, efficient, and customer-centric online shopping experience. We are dedicated to sourcing fresh and high-quality products, offering competitive prices, and ensuring timely deliveries. At M-Mart, we strive to make grocery shopping effortless and enjoyable for every household.</p>
                    <div className="flex items-center justify-center mt-10 mb-10">
                        {/* Add icons or images representing our values */}
                        <div className="mx-4 text-center">
                            <Leaf className="w-12 h-12 mx-auto mb-2" />
                            <h3 className="font-bold">Fresh & Quality Assured Products</h3>
                            <p className="text-gray-600">We carefully source products to ensure freshness and quality in every order.</p>
                        </div>
                        <div className="mx-4 text-center">
                            <Truck className="w-12 h-12 mx-auto mb-2" />
                            <h3 className="font-bold">Fast & Reliable Delivery</h3>
                            <p className="text-gray-600">We work hard to ensure your groceries reach your doorstep on time.</p>
                        </div>
                        <div className="mx-4 text-center">
                            <BadgeIndianRupee className="w-12 h-12 mx-auto mb-2" />
                            <h3 className="font-bold">Affordable Prices</h3>
                            <p className="text-gray-600">We offer great value on a wide range of products to fit your budget.</p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
 
}
export default AboutUs;