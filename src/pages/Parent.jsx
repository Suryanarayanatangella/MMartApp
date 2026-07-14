import {useState, useEffect, useRef} from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userSlice';
import Child from './Child';

// Cache to prevent multiple API calls
let cachedUsers = null;

export  default function Parent() {
    const dispatch = useDispatch();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const abortControllerRef = useRef(null);

    useEffect(() => {
        // Use cached data if available
        if (cachedUsers) {
            setUsers(cachedUsers);
            return;
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;
        
        setLoading(true);
        fetch('https://jsonplaceholder.typicode.com/users', { signal: controller.signal })
            .then(response => response.json())
            .then(data => {
                const userNames = data.map(user => user.name);
                cachedUsers = userNames; // Cache the results
                setUsers(userNames);
                setError(null);
            })
            .catch(error => {
                if (error.name !== 'AbortError') {
                    console.error('Error fetching users:', error);
                    setError('Failed to load users');
                }
            })
            .finally(() => setLoading(false));

        return () => controller.abort(); // Cleanup on unmount
    }, []);

    const sendData = () => {
        dispatch(setUser(users));
    }

    return (
        <div>
            <h1>Parent Component</h1>
            {loading && <p>Loading users...</p>}
            {error && <p style={{color: 'red'}}>{error}</p>}
            <button onClick={sendData} disabled={loading}>Add User</button>
            <Child />           
        </div>
    );
}