import React from "react";
import { motion } from "framer-motion";

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color = "blue",
  onClick,
}) => {
  const colorStyles = {
    blue: "from-blue-400 to-blue-600",
    purple: "from-purple-400 to-purple-600",
    green: "from-green-400 to-green-600",
    orange: "from-orange-400 to-orange-600",
    red: "from-red-400 to-red-600",
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
      onClick={onClick}
      whileHover={{ translateY: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            {trend && (
              <p
                className={`text-xs mt-2 font-semibold ${
                  trend > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend > 0 ? "▲" : "▼"} {Math.abs(trend)}% from last month
              </p>
            )}
          </div>
          {Icon && (
            <div
              className={`bg-gradient-to-br ${colorStyles[color]} rounded-lg p-4 flex items-center justify-center`}
            >
              <Icon size={28} className="text-white" />
            </div>
          )}
        </div>
      </div>
      <div className={`h-1 bg-gradient-to-r ${colorStyles[color]}`} />
    </motion.div>
  );
};

export default StatCard;
