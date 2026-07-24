import { useState, useDeferredValue, useMemo, useEffect } from "react";

export default function Products() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  // Create a deferred version of search
  const deferredSearch = useDeferredValue(search);
  useEffect(()=>{
    fetch('https://fakestoreapi.com/products/')
    .then(res=>res.json())
    .then(data=>{
      setProducts(data)
    })
    .catch(err=>console.log(err))
  },[])
  // Expensive filtering uses deferred value
  const filteredProducts = useMemo(() => {
    const words = deferredSearch
    .toLowerCase()
    .trim()
    .split(/\s+/);

    return products.filter((product) => {
        const title = product.title.toLowerCase();

        return words.some((word) => title.includes(word));
    });
  }, [deferredSearch, products]);

  return (
    <>
      <input
        type="text"
        placeholder="Search Products"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <h3>Products Found: {filteredProducts.length}</h3>

      {filteredProducts.map((product) => (
        <p key={product.id}>{product.title}</p>
      ))}
    </>
  );
}