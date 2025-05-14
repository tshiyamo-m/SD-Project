import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import './admin.css';
import {getAllUsers, updateIsReviewer, makeAdmin} from "../../utils/loginUtils";

const AdminPage = () => {
    //const [adminName, setAdminName] = useState("");
    const [users, setUsers] = useState([]);
    const [reviewRequests, setReviewRequests] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState({
        reviewRequests: [],
        users: [],
        admins: []
    });
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            const data = await getAllUsers();

            // Process users to decode tokens
            const processedUsers = data.map(user => {
                try {
                    if (user.token) {
                        const decoded = jwtDecode(user.token);
                        return {
                            ...user,
                            name: decoded.name,
                            email: decoded.email
                        };
                    }
                    return user;
                } catch (error) {
                    console.error('Error decoding user token:', error);
                    return {
                        ...user,
                        name: 'Unknown',
                        email: 'No email available'
                    };
                }
            });
            processedUsers()

            // Filter users based on their roles
            const reviewerRequests = processedUsers.filter(user => user.isReviewer === 'pending');
            const adminList = processedUsers.filter(user => user.isAdmin === true);
            const regularUsers = processedUsers.filter(user => !user.isAdmin);

            setReviewRequests(reviewerRequests);
            setAdmins(adminList);
            setUsers(regularUsers);

            // Initialize search results with all users
            setSearchResults({
                reviewRequests: reviewerRequests,
                users: regularUsers,
                admins: adminList
            });

        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        // Get admin name from local storage
        // const token = localStorage.getItem('token');
        // if (token) {
        //     try {
        //         const decoded = jwtDecode(token);
        //         setAdminName(decoded.name.split(" ")[0]); // Get first name
        //     } catch (error) {
        //         console.error('Error decoding token:', error);
        //     }
        // } else {
        //     // Redirect to landing page if no token exists
        //     navigate('/landingpage', { replace: true });
        // }

        // Fetch all users
        fetchUsers();
    }, [navigate]);

    // Search functionality
    useEffect(() => {
        if (searchTerm.trim() === "") {
            // If search is empty, show all users
            setSearchResults({
                reviewRequests: reviewRequests,
                users: users,
                admins: admins
            });
        } else {
            // Filter based on search term
            const term = searchTerm.toLowerCase();

            setSearchResults({
                reviewRequests: reviewRequests.filter(user =>
                    user.name.toLowerCase().includes(term) ||
                    user.email.toLowerCase().includes(term)
                ),
                users: users.filter(user =>
                    user.name.toLowerCase().includes(term) ||
                    user.email.toLowerCase().includes(term)
                ),
                admins: admins.filter(admin =>
                    admin.name.toLowerCase().includes(term) ||
                    admin.email.toLowerCase().includes(term)
                )
            });
        }
    }, [searchTerm, reviewRequests, users, admins]);

    const approveReviewer = async (userId) => {
        try {
            /*const response = await fetch('/api/login/update_is_reviewer', {
                method: 'POST',
                body: JSON.stringify({
                    isReviewer: "true",
                    userId: userId
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to approve reviewer!');
            }*/
            await updateIsReviewer(userId)

            // Update local state to reflect the change
            setReviewRequests(prevRequests =>
                prevRequests.filter(request => request._id !== userId)
            );

        } catch (error) {
            console.error('Error approving reviewer:', error);
        }
    };


    const makeUserAdmin = async (userId) => {
        try {

            await makeAdmin(userId);

            // Update local state to reflect the change
            const updatedUser = users.find(user => user._id === userId);
            if (updatedUser) {
                setUsers(prevUsers =>
                    prevUsers.filter(user => user._id !== userId)
                );
                setAdmins(prevAdmins => [...prevAdmins, {...updatedUser, isAdmin: true}]);
            }

        } catch (error) {
            console.error('Error making user admin:', error);
        }
    };

    const handleLogout = () => {
        // Clear authentication token and any other user data
        localStorage.removeItem('token');

        // Navigate to landing page with replace:true to prevent back navigation
        navigate('../', { replace: true });
    };

    return (
        <main className="admin-page">
            <header className="admin-header">
                <h1 className="admin-title">Admin Dashboard</h1>
                <section className="admin-top-bar">
                    <p className="admin-welcome">Welcome</p>
                    <button
                        className="logout-button"
                        onClick={handleLogout}
                        aria-label="Logout"
                    >
                        Logout
                    </button>
                </section>
            </header>

            <section className="search-section">
                <form className="search-form" onSubmit={(e) => e.preventDefault()}>
                    <fieldset>
                        <legend className="search-title">Find Users</legend>
                        <label htmlFor="user-search">Search by name or email:</label>
                        <input
                            type="search"
                            id="user-search"
                            name="user-search"
                            placeholder="Enter name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </fieldset>
                </form>
            </section>

            <section className="admin-sections">
                <section className="review-requests-section">
                    <h2 className="section-title">Reviewer Requests</h2>
                    {searchResults.reviewRequests.length > 0 ? (
                        <ul className="requests-list">
                            {searchResults.reviewRequests.map(request => (
                                <li key={request._id} className="request-item">
                                    <article className="request-card">
                                        <h3 className="user-name">{request.name}</h3>
                                        <p className="user-email">{request.email}</p>
                                        <button
                                            className="approve-button"
                                            onClick={() => approveReviewer(request._id)}
                                        >
                                            Approve as Reviewer
                                        </button>
                                    </article>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-requests">{searchTerm ? "No matching reviewer requests" : "No pending reviewer requests"}</p>
                    )}
                </section>

                <section className="users-section">
                    <h2 className="section-title">Regular Users</h2>
                    {searchResults.users.length > 0 ? (
                        <ul className="users-list">
                            {searchResults.users.map(user => (
                                <li key={user._id} className="user-item">
                                    <article className="user-card">
                                        <h3 className="user-name">{user.name}</h3>
                                        <p className="user-email">{user.email}</p>
                                        <button
                                            className="admin-button"
                                            onClick={() => makeUserAdmin(user._id)}
                                        >
                                            Make Admin
                                        </button>
                                    </article>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-users">{searchTerm ? "No matching regular users" : "No regular users found"}</p>
                    )}
                </section>

                <section className="admins-section">
                    <h2 className="section-title">Current Admins</h2>
                    {searchResults.admins.length > 0 ? (
                        <ul className="admins-list">
                            {searchResults.admins.map(admin => (
                                <li key={admin._id} className="admin-item">
                                    <article className="admin-card">
                                        <h3 className="user-name">{admin.name}</h3>
                                        <p className="user-email">{admin.email}</p>
                                    </article>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-admins">{searchTerm ? "No matching admins" : "No other admins found"}</p>
                    )}
                </section>
            </section>
        </main>
    );
};

export default AdminPage;