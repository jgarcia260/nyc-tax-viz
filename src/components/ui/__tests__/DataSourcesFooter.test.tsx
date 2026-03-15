import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataSourcesFooter } from "../DataSourcesFooter";

describe("DataSourcesFooter", () => {
  it("renders collapsible data sources section", () => {
    render(<DataSourcesFooter />);
    
    // Check for the main heading
    expect(screen.getByText("Data Sources & Citations")).toBeInTheDocument();
  });

  it("shows sources count in description", () => {
    render(<DataSourcesFooter />);
    
    // Check that it mentions sources
    expect(screen.getByText(/sources from government agencies/i)).toBeInTheDocument();
  });

  it("has a toggle button to expand/collapse", () => {
    render(<DataSourcesFooter />);
    
    // Should have a button for toggling
    const toggleButton = screen.getByRole("button", {
      name: /data sources & citations/i,
    });
    expect(toggleButton).toBeInTheDocument();
  });

  it("expands when clicked", async () => {
    const user = userEvent.setup();
    render(<DataSourcesFooter />);
    
    const toggleButton = screen.getByRole("button", {
      name: /data sources & citations/i,
    });
    
    // Initially collapsed (links should not be visible)
    expect(screen.queryByRole("link")).toBeNull();
    
    // Click to expand
    await user.click(toggleButton);
    
    // Now links should be visible
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });
});
