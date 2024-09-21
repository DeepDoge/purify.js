import { ref, tags } from "purify-js";
import { UserProfile } from "./UserProfile";

export function App() {
	return UserProfile({
		name: "John",
		age: 30,
		favouriteColors: ["red", "green", "blue"],
		isAvailable: true,
	});
}
