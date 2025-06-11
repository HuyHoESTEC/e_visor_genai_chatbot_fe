import { defineStore } from "pinia";
// import { login, register, logout } from '../services/auth';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "../firebase";
import router from "../router";

export const useAuthStore = defineStore('auth', {
  // -- Turn on this code if database of project has created --
  // state: () => ({
  //   user: null,
  //   token: localStorage.getItem('authToken') || null, // Get token from localStorage
  //   loading: false,
  //   error: null,
  // }),
  // getters: {
  //   isLoggedIn: (state) => !!state.token, // `!!` convert to boolean
  //   userDisplayName: (state) => state.user ? (state.user.name || state.user.email) : 'Guest',
  // },
  // actions: {
  //   async login(credentials) {
  //     this.loading = true;
  //     this.error = null;
  //     try {
  //       const response = await login(credentials); // Call API login
  //       this.user = response.data.user;
  //       this.token = response.data.token;
  //       localStorage.setItem('authToken', response.data.token); // Save token into localStorage
  //       this.router.push({ name: 'ContractReview' }); // Redirect after login success
  //     } catch (err) {
  //       this.error = err.response?.data?.message || 'Login failed. Please check your credentials.';
  //       console.error('Login error:', err);
  //     } finally {
  //       this.loading = false;
  //     }
  //   },
  //   async register(userData) {
  //     this.loading = true;
  //     this.error = null;
  //     try {
  //       const response = await register(userData);
  //       this.user = response.data.user;
  //       this.token = response.data.token;
  //       localStorage.setItem('authToken', response.data.token);
  //       this.router.push({ name: 'ContractReview' }); // Redirect after register success
  //     } catch (err) {
  //       this.error = err.response?.data?.message || 'Registration failed.';
  //       console.error('Register error:', err);
  //     } finally {
  //       this.loading = false;
  //     }
  //   },
  //   async logout() {
  //     this.loading = true;
  //     this.error = null;
  //     try {
  //       // Can call logout API to invalidate token on the server
  //       await logout(); // Assume the API Logout does not need data, just need tokens in the header
  //     } catch (err) {
  //       console.error('Logout API error (might be ignored if token is already invalidated):'. err);
  //     } finally {
  //       this.user = null;
  //       this.token = null;
  //       localStorage.removeItem('authToken'); // Delete token
  //       this.router.push({ name: 'Login' }); // Redirect into login page
  //       this.loading = false;
  //     }
  //   },
  //   // Function to check token while start or refresh page
  //   async checkAuth() {
  //     /**
  //      * If there is token but there is no user information, try to re -verify the token
  //      * This is where you will call an API `/me` or`/validate-token`
  //      * To get user information and confirm the valid token
  //      */
  //     try {
  //       /**
  //        * Assume API to get user information from tokens
  //        * const response = await api.get('/auth/me');
  //        * this.user = response.data.user;
  //        * For demo, just set a dummy user if token exists
  //        */
  //       this.user = { email: 'estec_user@biendongco.vn', name: 'Authenticated User' };
  //       console.log('Auth token found and user session restored.');
  //     } catch (err) {
  //       console.error('Auth check failted, token might be invalid:', err);
  //       this.logout(); // If token is not exception, logout
  //     }
  //   }
  // }

  // -- Turn on if this code if database is Firebase --
  state: () => ({
    user: null, // User information Firebase
    token: null, // Firebase ID Token
    loading: false, // Loading status
    error: null, // Error notification
    authReady: false // Add this variable to know when Firebase Auth is ready
  }),
  getters: {
    isLoggedIn: (state) => !!state.user && !!state.token, // Check both user and token
    userDisplayName: (state) => state.user ? (state.user.displayName || state.user.email) : 'Guest'
  },
  actions: {
    async register(credentials) {
      this.loading = true;
      this.error = null;
      try {
        // 1. Register new user with Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
        // const user = userCredential.user;

        // // After success register, automatic get ID Token (Optional)
        // const idToken = await user.getIdToken();
        // console.log('Firebase ID Token (After register): ', idToken);
        
        // // Save token and user information into store
        // this.token = idToken;
        // this.user = {
        //   uid: user.uid,
        //   email: user.email,
        //   displayName: user.displayName,
        //   photoURL: user.photoURL
        // };

        // localStorage.setItem('firebaseIdToken', idToken);
        // localStorage.setItem('firebaseUser', JSON.stringify(this.user));
        /**
         * (Optional) Call Backend to save more user information to your database if necessary
         * await this.callBackendProtectedApi(idToken); // Or another API for registration if you need additional information
         * Switch to the main page or Dashboard after successful registration
         */
        router.push('/login');
      } catch (err) {
        console.error('Error register:', err);
        switch (err.code) {
          case 'auth/email-already-in-use':
            this.error = 'This email was existed.';
            break;
          case 'auth/invalid-email':
            this.error = 'Email is invalid.';
            break;
          case 'auth/weak-password':
            this.error = 'Password is too weak (at least 6 characters).';
            break;
          default:
            this.error = `Error register: ${err.message}`;
        }
      } finally {
        this.loading = false;
      }
    },
    async login(credentials) {
      this.loading = true;
      this.error = null;
      try {
        // 1. Login with Firebase
        const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
        // const user = userCredential.user;

        // // 2. Get Firebase ID Token
        // const idToken = await user.getIdToken();
        // console.log('Firebase ID Token:', idToken);

        // // Save token and user information into store
        // this.token = idToken;
        // this.user = {
        //   uid: user.uid,
        //   email: user.email,
        //   displayName: user.displayName,
        //   photoUrl: user.photoURL
        // };

        // // Save tokens to localstorage to maintain login status
        // localStorage.setItem('firebaseIdToken', idToken);
        // localStorage.setItem('firebaseUser', JSON.stringify(this.user)); // Save more user information

        // // 3. (Optional) Call your API backend with this token
        // await this.callBackendProtectedApi(idToken);

        // Redirect after login success
        router.push('/chat'); // Replace /chat with Route you want to move towards
      } catch (err) {
        console.error('Error login:', err);
        // Resolve detail error firebase Auth
        switch(err.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            this.error = 'Email or password incorrectly.';
            break;
          case 'auth/invalid-email':
            this.error = 'Email is invalid';
            break;
          case 'auth/too-many-requests':
            this.error = 'You have tried to login too many times. Please try again later.';
            break;
          default:
            this.error = `Error: ${err.message}`;
        }
      } finally {
        this.loading = false;
      }
    },

    /**
     * This function is very important to synchronize Firebase Auth status with Pinia Store
     * and process when users refresh page
     */
    initAuthListener() {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          // User is logging in
          this.user = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          };
          this.token = await user.getIdToken(); // Get Token ID newest
          /**
           * Save to Localstorage (not required because the Firebase SDK has processed the session)
           * But it is helpful to create early in main.js` if you want
           */
          localStorage.setItem('firebaseIdToken', this.token);
          localStorage.setItem('firebaseUser', JSON.stringify(this.user));
          /**
           * If you have a backend API that needs authentication Firebase ID token, call here
           * await this.callBackendProtectedApi(this.token);
           */
          console.log('Firebase Auth State Changed: User logged in.');
        } else {
          // User has been logged out
          this.user = null;
          this.token = null;
          localStorage.removeItem('firebaseIdToken');
          localStorage.removeItem('firebaseUser');
          console.log('Firebase Auth State Changed: User logged out.');
        }
        this.authReady = true; // Mark that the authentication state has been first checked
      });
    },

    // Function to call API backend was protected
    async callBackendProtectedApi(token) {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch('http://localhost:3000/api/auth/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Send token in header Authoriztion
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          // If backend return error, maybe is token invalid, expire
          throw new Error(errorData.message || 'Error when call API backend.');
        }

        const data = await response.json();
        console.log('Data from Backend API (profile):', data);
        /**
         * You can update more user information from backend if needed
         * Example: this.user = { ..this.user, ...data.user };
         */
      } catch (err) {
        console.error('Error when call API Backend:', err);
        this.error = 'Can not connect with Backend or token is invalid: ' + err.message;
        /**
         * If the backend refuses tokens, can be logged out
         * await this.logout();
         */
      } finally {
        this.loading = false;
      }
    },

    // Function check and load token/user from localStorage when start app
    initializeAuth() {
      const storedToken = localStorage.getItem('firebaseIdToken');
      const storedUser = localStorage.getItem('firebaseUser');
      if (storedToken && storedUser) {
        this.token = storedToken;
        this.user = JSON.parse(storedUser);
        console.log('Auth initialized from localStorage.');
        /**
         * (Optional) Call the backend to re -verify the token if you want higher security
         * this.callBackendProtectedApi(storedToken);
         */
      }
    },

    async logout() {
      this.loading = true;
      this.error = null;
      try {
        await auth.signOut(); // Logout Firebase
        // this.user = null;
        // this.token = null;
        // localStorage.removeItem('firebaseIdToken');
        // localStorage.removeItem('firebaseUser');
        // console.log('Log out.');
        router.push('/login'); // Redirect to login page
      } catch (err) {
        console.error('Error when logout:', err);
        this.error = `Logout error: ${err.message}`;
      } finally {
        this.loading = false;
      }
    }
  }
});