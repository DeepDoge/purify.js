<script>
export default {
	inject: ["user"],
};
</script>

<template>
	<div>
		<h2>My Profile</h2>
		<p>Username: {{ user.username }}</p>
		<p>Email: {{ user.email }}</p>
		<button @click="() => user.updateUsername('Jane')">
			Update username to Jane
		</button>
	</div>
</template>
