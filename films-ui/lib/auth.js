const TOKEN_KEY = "films-token";
const USER_KEY = "films-user";

export function saveAuth(token, user) {
    console.log(token);
	window.localStorage.setItem(TOKEN_KEY, token);
	window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAuth() {
	const token = window.localStorage.getItem(TOKEN_KEY);
	const storedUser = window.localStorage.getItem(USER_KEY);

	if (!token || !storedUser) {
		return null;
	}

	try {
		return { token, user: JSON.parse(storedUser) };
	} catch {
		clearAuth();
		return null;
	}
}

export function clearAuth() {
	window.localStorage.removeItem(TOKEN_KEY);
	window.localStorage.removeItem(USER_KEY);
}
