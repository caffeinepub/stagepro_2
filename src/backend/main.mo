import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Order "mo:core/Order";

import Storage "mo:caffeineai-object-storage/Storage";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import AccessControl "mo:caffeineai-authorization/access-control";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";




actor {
  // ========== TYPES ==========
  type SubscriptionPlan = {
    #starter;
    #basic;
    #growth;
    #pro;
    #max;
  };

  type PlanLimits = {
    plan : SubscriptionPlan;
    photoLimit : Nat;
    videoLimit : Nat;
    price : Nat;
  };

  type UserProfile = {
    principal : Principal;
    name : Text;
    createdAt : Time.Time;
  };

  type SubscriptionUsage = {
    plan : SubscriptionPlan;
    photosUsed : Nat;
    videosUsed : Nat;
    createdAt : Time.Time;
    lastReset : Time.Time;
  };

  type DesignEntry = {
    principal : Principal;
    roomType : Text;
    style : Text;
    createdAt : Time.Time;
  };

  type CustomTheme = {
    principal : Principal;
    name : Text;
    prompt : Text;
    createdAt : Time.Time;
  };

  type AiGenerationLog = {
    id : Nat;
    userPrincipal : Principal;
    prompt : Text;
    inputImageBlobId : Text;
    outputImageBlobId : Text;
    createdAt : Time.Time;
  };

  type StarredEntry = {
    id : Nat;
    userPrincipal : Principal;
    name : Text;
    description : Text;
    imageUrl : Text;
    prompt : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  // ========== AUTHORIZATION ==========
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinObjectStorage();

  // ========== DATA STRUCTURES ==========
  let planLimits : [(SubscriptionPlan, PlanLimits)] = [
    (#starter, { plan = #starter; photoLimit = 8;   videoLimit = 1;  price = 0    }),
    (#basic,   { plan = #basic;   photoLimit = 20;  videoLimit = 5;  price = 500  }),
    (#growth,  { plan = #growth;  photoLimit = 60;  videoLimit = 15; price = 1000 }),
    (#pro,     { plan = #pro;     photoLimit = 120; videoLimit = 30; price = 2500 }),
    (#max,     { plan = #max;     photoLimit = 250; videoLimit = 50; price = 4000 }),
  ];

  func subscriptionPlanEqual(lhs : SubscriptionPlan, rhs : SubscriptionPlan) : Bool {
    switch (lhs, rhs) {
      case (#starter, #starter) { true };
      case (#basic,   #basic)   { true };
      case (#growth,  #growth)  { true };
      case (#pro,     #pro)     { true };
      case (#max,     #max)     { true };
      case (_,        _)        { false };
    };
  };

  func getPlanLimits(plan : SubscriptionPlan) : PlanLimits {
    switch (planLimits.find(func(entry) { subscriptionPlanEqual(plan, entry.0) })) {
      case (null)   { Runtime.trap("Plan not found") };
      case (?entry) { entry.1 };
    };
  };

  let userProfiles      = Map.empty<Principal, UserProfile>();
  let subscriptionUsage = Map.empty<Principal, SubscriptionUsage>();
  let paymentClaims     = Map.empty<Text, Bool>();
  let designEntries     = Map.empty<Int, DesignEntry>();
  let userThemes        = Map.empty<Principal, Map.Map<Int, CustomTheme>>();

  let aiGenerationLogs  = Map.empty<Nat, AiGenerationLog>();
  var nextAiLogId       = 0;

  let starredEntries    = Map.empty<Nat, StarredEntry>();
  var nextStarredEntryId = 0;

  // ========== USER MANAGEMENT ==========

  public shared ({ caller }) func selfRegister(name : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot register");
    };
    if (userProfiles.containsKey(caller)) {
      Runtime.trap("User already registered");
    };
    let now = Time.now();
    let profile : UserProfile = {
      principal = caller;
      name;
      createdAt = now;
    };
    let subscription : SubscriptionUsage = {
      plan = #starter;
      photosUsed = 0;
      videosUsed = 0;
      createdAt = now;
      lastReset = now;
    };
    userProfiles.add(caller, profile);
    subscriptionUsage.add(caller, subscription);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getMyProfile() : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    switch (userProfiles.get(caller)) {
      case (null)     { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
  };

  public shared ({ caller }) func updateMyProfile(newName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?p)   { p };
    };
    userProfiles.add(caller, { profile with name = newName });
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // ========== SUBSCRIPTIONS ==========

  public query ({ caller }) func getMySubscription() : async SubscriptionUsage {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view subscriptions");
    };
    switch (subscriptionUsage.get(caller)) {
      case (null) { Runtime.trap("Subscription not found") };
      case (?sub) { sub };
    };
  };

  public shared ({ caller }) func recordPhotoUsage() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record usage");
    };
    let sub = switch (subscriptionUsage.get(caller)) {
      case (null) { Runtime.trap("Subscription not found") };
      case (?s)   { s };
    };
    let limits = getPlanLimits(sub.plan);
    if (sub.photosUsed >= limits.photoLimit) {
      Runtime.trap("Photo limit reached for this month");
    };
    subscriptionUsage.add(caller, { sub with photosUsed = sub.photosUsed + 1 });
  };

  public shared ({ caller }) func recordVideoUsage() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record usage");
    };
    let sub = switch (subscriptionUsage.get(caller)) {
      case (null) { Runtime.trap("Subscription not found") };
      case (?s)   { s };
    };
    let limits = getPlanLimits(sub.plan);
    if (sub.videosUsed >= limits.videoLimit) {
      Runtime.trap("Video limit reached for this month");
    };
    subscriptionUsage.add(caller, { sub with videosUsed = sub.videosUsed + 1 });
  };

  public shared ({ caller }) func setUserPlan(user : Principal, newPlan : SubscriptionPlan) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let sub = switch (subscriptionUsage.get(user)) {
      case (null) { Runtime.trap("Subscription not found") };
      case (?s)   { s };
    };
    let _newLimits = getPlanLimits(newPlan);
    subscriptionUsage.add(user, {
      plan       = newPlan;
      photosUsed = 0;
      videosUsed = 0;
      createdAt  = sub.createdAt;
      lastReset  = Time.now();
    });
  };

  public shared func getPlanLimitsQuery(plan : SubscriptionPlan) : async PlanLimits {
    getPlanLimits(plan);
  };

  // ========== DODO PAYMENT INTEGRATION ==========

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func claimDodoPayment(paymentId : Text, planId : SubscriptionPlan) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can claim payments");
    };
    let isClaimed = switch (paymentClaims.get(paymentId)) {
      case (null)   { false };
      case (?claim) { claim };
    };
    if (isClaimed) {
      Runtime.trap("Payment already claimed");
    };
    let _newLimits = getPlanLimits(planId);
    let now = Time.now();
    let existingSub = subscriptionUsage.get(caller);
    let createdAt = switch (existingSub) {
      case (?s) { s.createdAt };
      case null { now };
    };
    subscriptionUsage.add(caller, {
      plan       = planId;
      photosUsed = 0;
      videosUsed = 0;
      createdAt;
      lastReset  = now;
    });
    paymentClaims.add(paymentId, true);
  };

  public shared ({ caller }) func createCheckoutSession(
    planId     : SubscriptionPlan,
    successUrl : Text,
    cancelUrl  : Text,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    let limits = getPlanLimits(planId);
    let planName = switch (planId) {
      case (#starter) { "starter" };
      case (#basic)   { "basic"   };
      case (#growth)  { "growth"  };
      case (#pro)     { "pro"     };
      case (#max)     { "max"     };
    };
    let requestBody = "{\"customer\":{\"email\":\"\"},\"payment_link\":{\"success_url\":\"" # successUrl # "\",\"failure_url\":\"" # cancelUrl # "\"},\"product_cart\":[{\"product_id\":\"prod_" # planName # "\",\"quantity\":1}],\"billing_currency\":\"USD\",\"metadata\":{\"userId\":\"" # caller.toText() # "\",\"plan\":\"" # planName # "\",\"amount\":" # limits.price.toText() # "}}";
    let headers : [OutCall.Header] = [
      { name = "Authorization"; value = "Bearer diitWzQsLSG_nMno.WzY7HqxaymOz3VNTogFw6EGl-i4FYX-1SKrA87O1pPj_gPN5" },
      { name = "Content-Type";  value = "application/json" },
    ];
    await OutCall.httpPostRequest(
      "https://api.dodopayments.com/payments",
      headers,
      requestBody,
      transform,
    );
  };

  // ========== DESIGN HISTORY ==========
  var designIdCounter = 0;

  public shared ({ caller }) func addDesign(roomType : Text, style : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add designs");
    };
    let design : DesignEntry = {
      principal = caller;
      roomType;
      style;
      createdAt = Time.now();
    };
    designEntries.add(designIdCounter, design);
    designIdCounter += 1;
    designIdCounter - 1;
  };

  module DesignEntryOrd {
    public func compareByCreatedAt(d1 : DesignEntry, d2 : DesignEntry) : Order.Order {
      Int.compare(d1.createdAt, d2.createdAt);
    };
  };

  public query ({ caller }) func getAllDesigns() : async [DesignEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view designs");
    };
    designEntries.values().toArray();
  };

  public query ({ caller }) func getDesignHistorySorted() : async [DesignEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view design history");
    };
    designEntries.values().toArray().sort(DesignEntryOrd.compareByCreatedAt);
  };

  // ========== CUSTOM THEMES ==========
  var themeIdCounter = 0;

  public shared ({ caller }) func addCustomTheme(name : Text, prompt : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add custom themes");
    };
    let theme : CustomTheme = {
      principal = caller;
      name;
      prompt;
      createdAt = Time.now();
    };
    let userThemeMap = switch (userThemes.get(caller)) {
      case (null) {
        let newMap = Map.empty<Int, CustomTheme>();
        userThemes.add(caller, newMap);
        newMap;
      };
      case (?map) { map };
    };
    userThemeMap.add(themeIdCounter, theme);
    themeIdCounter += 1;
    themeIdCounter - 1;
  };

  public query ({ caller }) func getMyCustomThemes() : async [CustomTheme] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view custom themes");
    };
    switch (userThemes.get(caller)) {
      case (null)  { [] };
      case (?map)  { map.values().toArray() };
    };
  };

  public shared ({ caller }) func deleteCustomTheme(themeId : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete custom themes");
    };
    switch (userThemes.get(caller)) {
      case (null)  { Runtime.trap("No themes found") };
      case (?map)  {
        if (not map.containsKey(themeId)) {
          Runtime.trap("Theme not found");
        };
        map.remove(themeId);
      };
    };
  };

  // ========== EXTERNAL BLOB STORAGE MANAGEMENT ==========
  public query func getImage(image : Storage.ExternalBlob) : async Storage.ExternalBlob {
    image;
  };

  // ========== AI LOG (BUSINESS INTELLIGENCE) ==========

  public shared ({ caller }) func logAiGeneration(prompt : Text, inputImageBlobId : Text, outputImageBlobId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can log AI generations");
    };
    let logId = nextAiLogId;
    let log : AiGenerationLog = {
      id = logId;
      userPrincipal = caller;
      prompt;
      inputImageBlobId;
      outputImageBlobId;
      createdAt = Time.now();
    };
    aiGenerationLogs.add(logId, log);
    nextAiLogId += 1;
  };

  public query ({ caller }) func getAiGenerationLogs() : async [AiGenerationLog] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access the AI generation logs");
    };
    aiGenerationLogs.values().toArray();
  };

  public query ({ caller }) func getAiGenerationLogsReverse() : async [AiGenerationLog] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access the AI generation logs");
    };
    aiGenerationLogs.values().toArray().reverse();
  };

  public query ({ caller }) func getAiGenerationLogsSorted() : async [AiGenerationLog] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access the AI generation logs");
    };
    func compareByCreatedAtDesc(a : AiGenerationLog, b : AiGenerationLog) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    };
    aiGenerationLogs.values().toArray().sort(compareByCreatedAtDesc);
  };

  public query ({ caller }) func getAiGenerationLogCount() : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view this statistic");
    };
    aiGenerationLogs.size();
  };

  // ========== STARRED DESIGNS ==========

  public shared ({ caller }) func addStarredEntry(name : Text, description : Text, imageUrl : Text, prompt : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add starred entries");
    };
    let entryId = nextStarredEntryId;
    let now = Time.now();
    let entry : StarredEntry = {
      id = entryId;
      userPrincipal = caller;
      name;
      description;
      imageUrl;
      prompt;
      createdAt = now;
      updatedAt = now;
    };
    starredEntries.add(entryId, entry);
    nextStarredEntryId += 1;
    entryId;
  };

  public query ({ caller }) func getMyStarredEntries() : async [StarredEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get starred entries");
    };
    func compareByCreatedAtDesc(a : StarredEntry, b : StarredEntry) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    };
    starredEntries.values().toArray().filter(func(entry) { entry.userPrincipal == caller }).sort(compareByCreatedAtDesc);
  };

  public query ({ caller }) func getStarredEntries(userPrincipal : Principal) : async [StarredEntry] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can get another user's starred entries");
    };
    func compareByCreatedAtDesc(a : StarredEntry, b : StarredEntry) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    };
    starredEntries.values().toArray().filter(func(entry) { entry.userPrincipal == userPrincipal }).sort(compareByCreatedAtDesc);
  };

  public shared ({ caller }) func updateStarredEntry(entryId : Nat, name : Text, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update starred entries");
    };
    let original = switch (starredEntries.get(entryId)) {
      case (null)   { Runtime.trap("Entry not found") };
      case (?entry) { entry };
    };
    if (original.userPrincipal != caller) {
      Runtime.trap("Unauthorized: Entry does not belong to this user");
    };
    starredEntries.add(entryId, { original with name; description; updatedAt = Time.now() });
  };

  public shared ({ caller }) func deleteStarredEntry(entryId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete starred entries");
    };
    let original = switch (starredEntries.get(entryId)) {
      case (null)   { Runtime.trap("Entry not found") };
      case (?entry) { entry };
    };
    if (original.userPrincipal != caller) {
      Runtime.trap("Unauthorized: Entry does not belong to this user");
    };
    starredEntries.remove(entryId);
  };

  public shared ({ caller }) func getMyStarredEntryCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get starred entries");
    };
    starredEntries.values().toArray().filter(func(entry) { entry.userPrincipal == caller }).size();
  };

  public query ({ caller }) func getTotalStarredEntryCount() : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can get total starred entry count");
    };
    starredEntries.size();
  };
};
