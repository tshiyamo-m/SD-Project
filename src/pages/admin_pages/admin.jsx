import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import './admin.css';
import { getAllUsers, updateIsReviewer, makeAdmin } from "../../utils/loginUtils";
import { Toaster, toast } from "sonner";

const AdminPage = () => {
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

            const reviewerRequests = processedUsers.filter(user => user.isReviewer === 'pending');
            const adminList = processedUsers.filter(user => user.isAdmin === true);
            const regularUsers = processedUsers.filter(user => !user.isAdmin);

            setReviewRequests(reviewerRequests);
            setAdmins(adminList);
            setUsers(regularUsers);

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
        fetchUsers();
    }, [navigate]);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setSearchResults({
                reviewRequests: reviewRequests,
                users: users,
                admins: admins
            });
        } else {
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
            const update = {
                userId: userId,
                isReviewer: "true",
            }
            await updateIsReviewer(update);
            setReviewRequests(prevRequests =>
                prevRequests.filter(request => request._id !== userId)
            );
            toast.success("User successfully approved", {
                style: { backgroundColor: "green", color: "white" },
            });
        } catch (error) {
            console.error('Error approving reviewer:', error);
        }
    };

    const denyReviewer = async (userId) => {
        try {
            const update = {
                userId: userId,
                isReviewer: "false",
            }
            await updateIsReviewer(update);
            setReviewRequests(prevRequests =>
                prevRequests.filter(request => request._id !== userId)
            );
            toast.error("User successfully denied reviewer", {
                style: { backgroundColor: "red", color: "white" },
            });
        } catch (error) {
            console.error('Error denying reviewer:', error);
        }
    };

    const makeUserAdmin = async (userId) => {
        try {
            const isAdmin = true;
            await makeAdmin(userId, isAdmin);
            const updatedUser = users.find(user => user._id === userId);
            if (updatedUser) {
                setUsers(prevUsers =>
                    prevUsers.filter(user => user._id !== userId)
                );
                setAdmins(prevAdmins => [...prevAdmins, {...updatedUser, isAdmin: true}]);
            }
            toast.success("User made admin", {
                style: { backgroundColor: "green", color: "white" },
            });
        } catch (error) {
            console.error('Error making user admin:', error);
        }
    };

    const removeAdmin = async (userId) => {
        try {
            const isAdmin = false;
            await makeAdmin(userId, isAdmin);
            const updatedAdmin = admins.find(admin => admin._id === userId);
            if (updatedAdmin) {
                setAdmins(prevAdmins =>
                    prevAdmins.filter(admin => admin._id !== userId)
                );
                setUsers(prevUsers => [...prevUsers, {...updatedAdmin, isAdmin: false}]);
            }
            toast.error("User removed as admin", {
                style: { backgroundColor: "red", color: "white" },
            });
        } catch (error) {
            console.error('Error removing admin:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
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
                                        <menu className="request-actions">
                                            <li>
                                                <button
                                                    className="approve-button"
                                                    onClick={() => approveReviewer(request._id)}
                                                >
                                                    Approve as Reviewer
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    className="deny-button"
                                                    onClick={() => denyReviewer(request._id)}
                                                >
                                                    Deny Request
                                                </button>
                                            </li>
                                        </menu>
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
                                        <button
                                            className="remove-admin-button"
                                            onClick={() => removeAdmin(admin._id)}
                                        >
                                            Remove Admin Rights
                                        </button>
                                    </article>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-admins">{searchTerm ? "No matching admins" : "No other admins found"}</p>
                    )}
                </section>
            </section>
            <Toaster position="bottom-right" />
        </main>
    );
};

export default AdminPage;