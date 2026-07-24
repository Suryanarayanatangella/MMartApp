import { Truck, Leaf, BadgeIndianRupee } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function AboutUs() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="w-full bg-gray-200 mt-10 p-6 shadow rounded">
          <h1 className="text-3xl font-bold text-center mt-10">About Us</h1>
          <p className="text-center mt-4 text-gray-600">
            Welcome to <b>M-Mart</b>, your trusted online destination for fresh groceries, fruits,
            vegetables, and everyday essentials. We are committed to making shopping simple,
            convenient, and affordable by bringing quality products directly to your doorstep.
          </p>
          <p className="text-center mt-4 text-gray-600">
            At M-Mart, we believe that every family deserves access to fresh and high-quality
            products without the stress of visiting crowded stores.
          </p>
        </div>

        <div className="w-full bg-gray-200 mt-10 p-6 shadow rounded">
          <h2 className="text-2xl font-bold text-center">Why Choose M-Mart?</h2>
          <p className="text-center mt-4 text-gray-600">
            Our mission is to revolutionize the way people shop for groceries by providing a
            reliable, efficient, and customer-centric online shopping experience.
          </p>
          <div className="flex items-center justify-center mt-10 mb-10">
            <div className="mx-4 text-center">
              <Leaf className="w-12 h-12 mx-auto mb-2" />
              <h3 className="font-bold">Fresh &amp; Quality Assured Products</h3>
              <p className="text-gray-600">We carefully source products to ensure freshness and quality in every order.</p>
            </div>
            <div className="mx-4 text-center">
              <Truck className="w-12 h-12 mx-auto mb-2" />
              <h3 className="font-bold">Fast &amp; Reliable Delivery</h3>
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
  );
}
