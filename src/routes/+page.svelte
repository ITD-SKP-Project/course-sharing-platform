<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
</script>

<Card.Root class="w-[350px]">
	<Card.Header>
		<Card.Title>Create project</Card.Title>
		<Card.Description>Deploy your new project in one-click.</Card.Description>
	</Card.Header>
	<Card.Content>
		<form>
			<div class="grid w-full items-center gap-4">
				<div class="flex flex-col space-y-1.5">
					<Label for="name">Name</Label>
					<Input id="name" placeholder="Name of your project" />
				</div>
			</div>
		</form>
	</Card.Content>
	<Card.Footer class="flex justify-between">
		<Button variant="outline">Cancel</Button>
		<Button>Deploy</Button>
	</Card.Footer>
</Card.Root>
