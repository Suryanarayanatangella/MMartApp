import {useSelector} from 'react-redux';
export default function Child() {
    const users = useSelector((state) => state.user.user);
    console.log('users in child:', users);
    return (
        <div>
            {
                users && users.length > 0 ? (
                    <ul>
                        {users.map((user, index) => (
                            <li key={index}>{user}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No users available</p>
                )
            }
        </div>
    );
}