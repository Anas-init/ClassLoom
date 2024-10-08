import React, {useState} from 'react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword]  = useState('');
    const [error, setError] = useState(null);

    // Change to axios
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            // fetch implementation
            const response = await fetch('http://localhost:8000/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username, email, password})
            });
            const data = await response.json();

            // axios implementation
            /*
                const response = await axios.post('http://localhost:8000/register/', {
                    username,
                    email,
                    password
                });
                console.log(response.data);
            */

            console.log(data);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input 
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Username"
            />
            <input 
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
            />
            <input 
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
            />
            <button type="submit">Register</button>
            {error && <p style={{color: 'red'}}>{error}</p>}
        </form>
    );
};

export default Register;