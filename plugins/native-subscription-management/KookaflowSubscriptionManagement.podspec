Pod::Spec.new do |s|
  s.name = 'KookaflowSubscriptionManagement'
  s.version = '1.0.0'
  s.summary = "Kookaflow Capacitor bridge for Apple's native subscription-management sheet."
  s.license = { :type => 'MIT' }
  s.homepage = 'https://kookaflow.com'
  s.author = { 'Kookaflow' => 'hello@kookaflow.com' }
  s.source = { :git => 'https://kookaflow.com', :tag => s.version.to_s }
  s.source_files = 'ios/Sources/**/*.{swift,h,m,c,cc,mm,cpp}'
  s.ios.deployment_target = '15.0'
  s.dependency 'Capacitor'
  s.swift_version = '5.9'
end
