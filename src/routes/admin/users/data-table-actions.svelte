<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { Lock, MoreHorizontal, Send, UserRoundX } from 'lucide-svelte';
	export let email: string;
	export let id: string;

	import { Pen } from 'lucide-svelte';
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} size="icon" class="relative h-8 w-8 p-0">
			<span class="sr-only">Open menu</span>
			<MoreHorizontal class="h-4 w-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Handlinger</DropdownMenu.Label>
			<DropdownMenu.Item on:click={() => navigator.clipboard.writeText(email)}>
				Kopier email
			</DropdownMenu.Item>
			<DropdownMenu.Item on:click={() => navigator.clipboard.writeText(id)}>
				Kopier id
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item class="gap-4" href={'mailto:' + email}>
			<Send class="ml-2 h-4 w-4" />
			Send email
		</DropdownMenu.Item>
		<DropdownMenu.Item class="gap-4">
			<Pen class="ml-2 h-4 w-4" />
			Rediger
		</DropdownMenu.Item>
		<DropdownMenu.Item class="gap-4 text-yellow-500 hover:!bg-yellow-500/50">
			<Lock class="ml-2 h-4 w-4" />
			Deaktiver
		</DropdownMenu.Item>
		<DropdownMenu.Item class="gap-4 text-red-500 hover:!bg-red-500/50">
			<UserRoundX class="ml-2 h-4 w-4" />
			Slet
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
