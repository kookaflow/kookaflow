import Capacitor
import StoreKit
import UIKit

@objc(KookaflowSubscriptionManagementPlugin)
public class KookaflowSubscriptionManagementPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "KookaflowSubscriptionManagementPlugin"
    public let jsName = "KookaflowSubscriptionManagement"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "showManageSubscriptions", returnType: CAPPluginReturnPromise)
    ]

    @objc func showManageSubscriptions(_ call: CAPPluginCall) {
        Task { @MainActor in
            guard let scene = self.bridge?.viewController?.view.window?.windowScene else {
                call.reject("The active iOS window is unavailable.")
                return
            }

            do {
                try await AppStore.showManageSubscriptions(in: scene)
                call.resolve()
            } catch {
                call.reject("Apple's subscription management could not be opened.", nil, error)
            }
        }
    }
}
