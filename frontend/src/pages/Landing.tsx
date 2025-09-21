import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PitchDeckForm from "@/components/PitchDeckForm";
// import { FormFacadeEmbed } from "@/components/FormFacadeEmbed";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { TrendingUp, Zap } from "lucide-react";

export default function Landing() {
  const [showFounderModal, setShowFounderModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { toast } = useToast();

  const handleSubmit = () => {
    setShowFounderModal(false);
    setShowSuccessModal(true);
    toast({
      title: "Submission Successful!",
      description: "Thank you for submitting your startup information.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                GenaVentureStartup
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Connecting visionary founders with strategic investors. Join our
              exclusive platform to either showcase your startup or discover the
              next unicorn.
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                onClick={() => setShowFounderModal(true)}
                size="lg"
                className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 min-w-64"
                data-testid="button-founder"
              >
                <div className="flex items-center justify-center space-x-3">
                  <Zap className="w-6 h-6" />
                  <span>I'm a Founder</span>
                </div>
              </Button>

              <Link href="/investor">
                <Button
                  variant="outline"
                  size="lg"
                  className="group relative px-8 py-4 bg-secondary text-secondary-foreground border-2 border-border rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:border-primary transform hover:-translate-y-1 transition-all duration-300 min-w-64"
                  data-testid="button-investor"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <TrendingUp className="w-6 h-6" />
                    <span>I'm an Investor</span>
                  </div>
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Section */}
          {/* <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-card rounded-xl border border-border shadow-sm">
              <div
                className="text-3xl font-bold text-primary mb-2"
                data-testid="text-stat-companies"
              >
                150+
              </div>
              <div className="text-muted-foreground">Startups Funded</div>
            </div>
            <div className="text-center p-6 bg-card rounded-xl border border-border shadow-sm">
              <div
                className="text-3xl font-bold text-primary mb-2"
                data-testid="text-stat-funding"
              >
                $2.5B
              </div>
              <div className="text-muted-foreground">Total Investment</div>
            </div>
            <div className="text-center p-6 bg-card rounded-xl border border-border shadow-sm">
              <div
                className="text-3xl font-bold text-primary mb-2"
                data-testid="text-stat-investors"
              >
                500+
              </div>
              <div className="text-muted-foreground">Active Investors</div>
            </div>
          </div> */}
        </div>
      </section>

      {/* Founder Form Modal */}
      <Dialog open={showFounderModal} onOpenChange={setShowFounderModal}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-auto"
          data-testid="modal-founder-form"
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">
              Pitch Us Your Vision
            </DialogTitle>
          </DialogHeader>
          <div className="p-2">
            <PitchDeckForm onSubmit={handleSubmit} />
            {/* <FormFacadeEmbed
              formFacadeURL="https://formfacade.com/include/102640100617494258858/form/1FAIpQLSfINaR6ZOG-bhWgzRZIHsH_Yskvm1wfU1iLxzgen56Cyt51Bg/classic.js/?div=ff-compose"
              onSubmitForm={handleFormSubmit}
            /> */}
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md" data-testid="modal-success">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Submission Successful!
            </h3>
            <p className="text-muted-foreground mb-6">
              Thank you for submitting your startup information. Our team will
              review your application and get back to you within 48 hours.
            </p>
            <Button
              onClick={() => setShowSuccessModal(false)}
              data-testid="button-success-continue"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
