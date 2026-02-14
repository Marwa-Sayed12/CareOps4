import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, User, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const GetStarted = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <nav className="h-16 flex items-center px-6 border-b border-border">
      <Link to="/" className="text-xl font-bold text-primary tracking-tight">CareOps</Link>
    </nav>
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">How would you like to use CareOps?</h1>
          <p className="text-muted-foreground mt-3">Select your role to get started</p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Business Owner (Admin) */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <Link to="/admin/login" className="block h-full">
              <div className="h-full p-8 rounded-2xl bg-card border-2 border-border hover:border-primary transition-colors group cursor-pointer">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Business Owner</h2>
                <p className="text-sm text-muted-foreground mb-4">Manage your entire business</p>
                <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                  <li>• Full dashboard access</li>
                  <li>• Manage bookings & staff</li>
                  <li>• Configure automation</li>
                  <li>• View all reports</li>
                </ul>
                <Button className="w-full gap-2 group-hover:gap-3 transition-all">
                  Continue as Admin <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Link>
          </motion.div>

          {/* Staff Member (New Option) */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            <Link to="/staff/login" className="block h-full">
              <div className="h-full p-8 rounded-2xl bg-card border-2 border-border hover:border-primary transition-colors group cursor-pointer">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Staff Member</h2>
                <p className="text-sm text-muted-foreground mb-4">Limited access to daily tasks</p>
                <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                  <li>• Inbox & messaging</li>
                  <li>• Manage bookings</li>
                  <li>• Track form completion</li>
                  <li>• Limited dashboard view</li>
                </ul>
                <Button variant="outline" className="w-full gap-2 group-hover:gap-3 transition-all">
                  Continue as Staff <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Link>
          </motion.div>

          {/* Customer */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            <Link to="/customer/form" className="block h-full">
              <div className="h-full p-8 rounded-2xl bg-card border-2 border-border hover:border-primary transition-colors group cursor-pointer">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <User className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Customer</h2>
                <p className="text-sm text-muted-foreground mb-4">No login required</p>
                <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                  <li>• Submit contact form</li>
                  <li>• Book appointments</li>
                  <li>• Fill required forms</li>
                  <li>• Receive notifications</li>
                </ul>
                <Button variant="outline" className="w-full gap-2 group-hover:gap-3 transition-all">
                  Continue as Customer <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Info Footer */}
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={fadeUp} 
          custom={4} 
          className="mt-8 text-center"
        >
          <p className="text-xs text-muted-foreground">
            Staff members need to be invited by a business owner. 
            <Link to="/admin/signup" className="text-primary hover:underline ml-1">
              Create a business account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  </div>
);

export default GetStarted;