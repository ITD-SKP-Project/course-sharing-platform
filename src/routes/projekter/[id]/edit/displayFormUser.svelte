<script lang="ts">
	import type { UserEssentials } from '$lib/types';

	export let id: string;
	export let users: UserEssentials[];
	console.log('users:', users);

	const user = users.find((user) => user.id.toString() == id);
	console.log('user:', user);
</script>

{#if user}
	<a href="/?forfatter={user.firstname}-{user.lastname}">
		<div class="flex min-w-max items-center gap-2">
			<div
				class="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/75 text-secondary-foreground"
			>
				{user.firstname ? user.firstname[0] : ''}{user.lastname ? user.lastname[0] : ''}
			</div>
			<span class="ml-2 font-medium"
				>{user.firstname}
				{user.lastname}
			</span>
		</div>
	</a>
{/if}
