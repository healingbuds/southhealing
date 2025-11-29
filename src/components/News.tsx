import { Link } from "react-router-dom";
import ScrollAnimation from "@/components/ScrollAnimation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { newsArticles } from "@/data/newsArticles";

const News = () => {
  // Show only 3 articles on homepage
  const displayedArticles = newsArticles.slice(0, 3);

  return (
    <section id="news" className="bg-background py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollAnimation>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-12">
            <div>
              <h2 className="font-pharma text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight">
                The Wire
              </h2>
              <p className="font-geist text-muted-foreground mt-2">
                Inside news & updates
              </p>
            </div>
            <Link to="/the-wire">
              <Button
                variant="outline"
                size="lg"
                className="font-body rounded-full text-sm sm:text-base"
              >
                View all updates
              </Button>
            </Link>
          </div>
        </ScrollAnimation>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayedArticles.map((item, index) => (
            <ScrollAnimation key={item.id} delay={index * 0.1}>
              <Link to={`/the-wire/${item.id}`}>
                <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 rounded-2xl cursor-pointer hover:-translate-y-2 h-full flex flex-col">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:brightness-110"
                    />
                    {item.featured && (
                      <div className="absolute inset-0 bg-gradient-to-t from-sage-dark/90 to-sage-dark/40 flex items-center justify-center">
                        <div className="text-center text-white px-4">
                          <p className="text-sm font-semibold text-secondary mb-2 tracking-wider">
                            FEATURED
                          </p>
                          <h3 className="text-xl font-bold leading-tight">
                            Dr. Green Partnership
                          </h3>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.tags.map((tag, tagIndex) => (
                        <Badge
                          key={tagIndex}
                          variant="outline"
                          className="font-geist border-secondary/60 text-secondary bg-secondary/10 rounded-full px-3 py-1 text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <h3 className="font-geist text-lg font-semibold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors tracking-tight line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="font-geist text-muted-foreground text-sm line-clamp-3 leading-relaxed flex-grow">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                      <span className="text-xs text-muted-foreground font-geist">
                        {item.date}
                      </span>
                      <Button
                        variant="link"
                        className="p-0 text-primary font-semibold text-sm"
                      >
                        Read More →
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
};

export default News;
