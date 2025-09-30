flowchart TD
  Start[User opens app]
  Start --> Landing
  Landing[Landing Page]
  Landing --> Auth
  Auth[Login or Signup]
  Auth --> Dashboard
  Dashboard[Main Dashboard]
  Dashboard --> Create
  Dashboard --> Manage
  Create[New Content Editor]
  Create --> Draft
  Draft[Save as Draft]
  Draft --> Schedule
  Schedule[Schedule Publication]
  Schedule --> Publish
  Publish[Publish Content]
  Publish --> Notify
  Notify[Post Publish Actions]
  Notify --> Webhook
  Webhook[Webhook Integration]
  Webhook --> External
  External[External Services]
  Manage[Edit Existing Content]
  Manage --> Create