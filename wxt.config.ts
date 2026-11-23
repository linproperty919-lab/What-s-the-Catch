import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: "What's the Catch",
    description:
      'Flags auto-renewals, hidden fees and dark patterns on checkout pages. Runs on-device; nothing leaves your browser.',
    permissions: ['storage', 'alarms'],
    // Week 3: move content-script host access to optional_host_permissions,
    // requested during onboarding (see CLAUDE.md "Auto-scan").
  },
});
